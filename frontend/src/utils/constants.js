// User Roles
export const ROLES = {
  ADMIN: 'admin',
  DIVISION_MANAGER: 'division_manager',
  DEPARTMENT_MANAGER: 'department_manager',
  EMPLOYEE: 'employee'
};

// Division data (will be fetched from API)
export const DIVISIONS = [
  { id: 1, name: 'Production', color: 'blue', description: 'Production Division' },
  { id: 2, name: 'Quality Assurance', color: 'green', description: 'Quality Division' },
  { id: 3, name: 'Maintenance', color: 'orange', description: 'Maintenance Division' },
  { id: 4, name: 'Logistics', color: 'purple', description: 'Logistics Division' },
];

// Department data (will be fetched from API)
export const DEPARTMENTS = {
  1: [ // Production
    { id: 1, name: 'Production Line A', code: 'PROD_A', manager: 'John Smith' },
    { id: 2, name: 'Production Line B', code: 'PROD_B', manager: 'Sarah Johnson' },
    { id: 3, name: 'Production Line C', code: 'PROD_C', manager: 'Mike Wilson' },
    { id: 4, name: 'Assembly', code: 'ASSEMBLY', manager: 'Robert Chen' },
  ],
  2: [ // Quality Assurance
    { id: 5, name: 'QC Incoming', code: 'QC_IN', manager: 'Jane Doe' },
    { id: 6, name: 'QC Production', code: 'QC_PROD', manager: 'Lisa Brown' },
    { id: 7, name: 'QC Final', code: 'QC_FINAL', manager: 'Tom Wilson' },
  ],
  3: [ // Maintenance
    { id: 8, name: 'Mechanical', code: 'MECH', manager: 'Alex Turner' },
    { id: 9, name: 'Electrical', code: 'ELEC', manager: 'Emma Davis' },
    { id: 10, name: 'Preventive', code: 'PREV', manager: 'Chris Miller' },
  ],
  4: [ // Logistics
    { id: 11, name: 'Warehouse', code: 'WARE', manager: 'David Wilson' },
    { id: 12, name: 'Shipping', code: 'SHIP', manager: 'Sophia Garcia' },
    { id: 13, name: 'Receiving', code: 'RECV', manager: 'James Taylor' },
  ],
};

// Helper functions
export const getDivisionById = (id) => {
  return DIVISIONS.find(d => d.id === id);
};

export const getDepartmentById = (divisionId, departmentId) => {
  const departments = DEPARTMENTS[divisionId] || [];
  return departments.find(d => d.id === departmentId);
};