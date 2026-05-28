export const PERMISSIONS = {
  // Farm
  VIEW_ANY_FARM: "ViewAny Farm",
  VIEW_FARM: "View Farm",
  CREATE_FARM: "Create Farm",
  UPDATE_FARM: "Update Farm",
  DELETE_FARM: "Delete Farm",

  // Cow
  VIEW_ANY_COW: "ViewAny Cow",
  VIEW_COW: "View Cow",
  CREATE_COW: "Create Cow",
  UPDATE_COW: "Update Cow",
  DELETE_COW: "Delete Cow",
  RETIRE_COW: "Retire Cow",

  // Collar
  VIEW_ANY_COLLAR: "ViewAny Collar",
  VIEW_COLLAR: "View Collar",
  CREATE_COLLAR: "Create Collar",
  UPDATE_COLLAR: "Update Collar",
  DELETE_COLLAR: "Delete Collar",

  // User
  VIEW_ANY_USER: "ViewAny User",
  VIEW_USER: "View User",
  CREATE_USER: "Create User",
  UPDATE_USER: "Update User",
  DELETE_USER: "Delete User",

  // Role
  VIEW_ANY_ROLE: "ViewAny Role",
  VIEW_ROLE: "View Role",
  CREATE_ROLE: "Create Role",
  UPDATE_ROLE: "Update Role",
  DELETE_ROLE: "Delete Role",

  // Permission
  VIEW_ANY_PERMISSION: "ViewAny Permission",
  VIEW_PERMISSION: "View Permission",
  CREATE_PERMISSION: "Create Permission",
  UPDATE_PERMISSION: "Update Permission",
  DELETE_PERMISSION: "Delete Permission",

  // PermissionGroup
  VIEW_ANY_PERMISSION_GROUP: "ViewAny PermissionGroup",
  VIEW_PERMISSION_GROUP: "View PermissionGroup",
  CREATE_PERMISSION_GROUP: "Create PermissionGroup",
  UPDATE_PERMISSION_GROUP: "Update PermissionGroup",
  DELETE_PERMISSION_GROUP: "Delete PermissionGroup",

  // Notification
  VIEW_ANY_NOTIFICATION: "ViewAny Notification",
  VIEW_NOTIFICATION: "View Notification",

  // MedicalRecord
  VIEW_ANY_MEDICAL_RECORD: "ViewAny MedicalRecord",
  VIEW_MEDICAL_RECORD: "View MedicalRecord",
  CREATE_MEDICAL_RECORD: "Create MedicalRecord",
  UPDATE_MEDICAL_RECORD: "Update MedicalRecord",
  DELETE_MEDICAL_RECORD: "Delete MedicalRecord",

  // ClinicalRecord
  VIEW_ANY_CLINICAL_RECORD: "ViewAny ClinicalRecord",
  VIEW_CLINICAL_RECORD: "View ClinicalRecord",
  CREATE_CLINICAL_RECORD: "Create ClinicalRecord",
  UPDATE_CLINICAL_RECORD: "Update ClinicalRecord",
  DELETE_CLINICAL_RECORD: "Delete ClinicalRecord",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
