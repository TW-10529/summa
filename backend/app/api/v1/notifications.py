# app/api/v1/notifications.py - COMPLETE VERSION
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app import models, schemas
from app.database import get_db
from app.api.v1.auth import get_current_active_user

router = APIRouter()

# Request and Response Schemas
class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"
    target: str = "all"  # all, division_managers, department_managers, employees, specific
    target_ids: Optional[List[int]] = None
    
    model_config = ConfigDict(from_attributes=True)

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    read: bool
    read_at: Optional[datetime] = None
    created_by: Optional[int] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class NotificationsListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
    
    model_config = ConfigDict(from_attributes=True)

@router.post("/send", response_model=Dict[str, Any])
def send_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Send notification to users"""
    try:
        # Only admin and division managers can send notifications
        if current_user.role not in [models.Role.ADMIN, models.Role.DIVISION_MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to send notifications"
            )
        
        # Validate notification data
        if not notification.title.strip() or not notification.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title and message are required"
            )
        
        # Determine recipients based on target
        recipients_query = db.query(models.User).filter(
            models.User.is_active == True
        )
        
        if notification.target == "division_managers":
            recipients_query = recipients_query.filter(
                models.User.role == models.Role.DIVISION_MANAGER
            )
        elif notification.target == "department_managers":
            recipients_query = recipients_query.filter(
                models.User.role == models.Role.DEPARTMENT_MANAGER
            )
        elif notification.target == "employees":
            recipients_query = recipients_query.filter(
                models.User.role == models.Role.EMPLOYEE
            )
        elif notification.target == "specific":
            if not notification.target_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="target_ids required for specific target"
                )
            recipients_query = recipients_query.filter(
                models.User.id.in_(notification.target_ids)
            )
        
        recipients = recipients_query.all()
        
        if not recipients:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No recipients found"
            )
        
        # Create notification records
        notification_records = []
        current_time = datetime.now()
        
        for recipient in recipients:
            notification_record = models.Notification(
                user_id=recipient.id,
                title=notification.title,
                message=notification.message,
                type=notification.type,
                read=False,
                created_by=current_user.id,
                created_at=current_time
            )
            notification_records.append(notification_record)
        
        if notification_records:
            db.add_all(notification_records)
        
        # Create audit log
        audit_log = models.AuditLog(
            user_id=current_user.id,
            action="send_notification",
            resource="notification",
            details={
                "title": notification.title,
                "message": notification.message,
                "type": notification.type,
                "target": notification.target,
                "recipient_count": len(recipients),
                "recipient_ids": [r.id for r in recipients]
            }
        )
        db.add(audit_log)
        
        db.commit()
        
        # Refresh to get IDs
        for record in notification_records:
            db.refresh(record)
        
        return {
            "message": f"Notification sent to {len(recipients)} users",
            "recipients": len(recipients),
            "notification_ids": [n.id for n in notification_records]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending notification: {str(e)}"
        )

@router.get("/", response_model=NotificationsListResponse)
def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    read: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get notifications for current user"""
    try:
        query = db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id
        )
        
        if read is not None:
            query = query.filter(models.Notification.read == read)
        
        total = query.count()
        notifications = query.order_by(
            models.Notification.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        # Get unread count
        unread_count = db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id,
            models.Notification.read == False
        ).count()
        
        return {
            "notifications": notifications,
            "total": total,
            "unread_count": unread_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching notifications: {str(e)}"
        )

@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Mark notification as read"""
    try:
        notification = db.query(models.Notification).filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        if not notification.read:
            notification.read = True
            notification.read_at = datetime.now()
            db.commit()
        
        return {"message": "Notification marked as read", "notification_id": notification_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking notification as read: {str(e)}"
        )

@router.put("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Mark all notifications as read"""
    try:
        result = db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id,
            models.Notification.read == False
        ).update({
            "read": True,
            "read_at": datetime.now()
        })
        
        db.commit()
        
        return {"message": f"Marked {result} notifications as read"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking all notifications as read: {str(e)}"
        )

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Delete a notification"""
    try:
        notification = db.query(models.Notification).filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        db.delete(notification)
        db.commit()
        
        return {"message": "Notification deleted", "notification_id": notification_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting notification: {str(e)}"
        )

@router.get("/count")
def get_notification_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get notification counts for current user"""
    try:
        total = db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id
        ).count()
        
        unread = db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id,
            models.Notification.read == False
        ).count()
        
        return {
            "total": total,
            "unread": unread,
            "read": total - unread
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting notification count: {str(e)}"
        )