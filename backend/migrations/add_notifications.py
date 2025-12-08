# migrations/add_notifications.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app import models
from sqlalchemy import text

def add_notification_table():
    db = SessionLocal()
    
    try:
        print("Creating notifications table...")
        
        # Create notifications table
        with engine.connect() as conn:
            # Create notifications table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR NOT NULL,
                    message TEXT NOT NULL,
                    type VARCHAR DEFAULT 'info',
                    read BOOLEAN DEFAULT FALSE,
                    read_at TIMESTAMP WITH TIME ZONE,
                    created_by INTEGER REFERENCES users(id),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Create index for better performance
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)"))
            
            conn.commit()
        
        print("✓ Notifications table created successfully")
        
        # Insert initial notification settings
        print("Adding notification settings...")
        
        notification_settings = [
            {
                "key": "notifications_enabled",
                "value": True,
                "category": "notifications",
                "description": "Enable system notifications"
            },
            {
                "key": "email_notifications",
                "value": False,
                "category": "notifications",
                "description": "Send email notifications"
            },
            {
                "key": "push_notifications",
                "value": True,
                "category": "notifications",
                "description": "Enable push notifications"
            },
            {
                "key": "notification_sound",
                "value": True,
                "category": "notifications",
                "description": "Play sound for new notifications"
            },
            {
                "key": "notify_new_user",
                "value": True,
                "category": "notifications",
                "description": "Send notification when new user is created"
            },
            {
                "key": "notify_shift_change",
                "value": True,
                "category": "notifications",
                "description": "Send notification for shift changes"
            },
        ]
        
        for setting_data in notification_settings:
            # Check if setting already exists
            existing = db.query(models.SystemSettings).filter(
                models.SystemSettings.key == setting_data["key"]
            ).first()
            
            if not existing:
                setting = models.SystemSettings(**setting_data)
                db.add(setting)
                print(f"✓ Added setting: {setting_data['key']}")
        
        db.commit()
        
        # Add sample notifications for admin
        print("Adding sample notifications...")
        
        admin = db.query(models.User).filter(
            models.User.role == models.Role.ADMIN
        ).first()
        
        if admin:
            sample_notifications = [
                {
                    "user_id": admin.id,
                    "title": "Welcome to Factory Shift Management",
                    "message": "Welcome to the system! Start by adding your divisions and departments.",
                    "type": "info",
                    "read": False
                },
                {
                    "user_id": admin.id,
                    "title": "System Update Available",
                    "message": "A new system update is available. Please review and apply when convenient.",
                    "type": "warning",
                    "read": False
                },
                {
                    "user_id": admin.id,
                    "title": "Backup Successful",
                    "message": "Weekly system backup completed successfully.",
                    "type": "success",
                    "read": True
                }
            ]
            
            for notif_data in sample_notifications:
                notification = models.Notification(**notif_data)
                db.add(notification)
            
            db.commit()
            print("✓ Sample notifications added")
        
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_notification_table()