export interface UserDto {
    id: string;
    fullName: string;
    email: string;
    role: string | null;
    department: string | null;
    plant: string | null;
    jobTitle?: string | null;
    isActive: boolean;
    status: string;
    createdOn?: Date;
    joinedDate?: string;
    phoneNumber?: string;
    teId?: string;
    transportStation?: string;

    // Supervisor hierarchy fields
    supervisorId?: string;
    supervisorName?: string;
    isSupervisor: boolean;
    directReportsCount: number;
}

export interface SupervisorGroupDto {
    supervisorId: string;
    supervisorName: string;
    supervisorJobTitle: string;
    supervisorTeId: string;
    directReports: UserDto[];
}

export interface UserHierarchyResponse {
    supervisors: SupervisorGroupDto[];
    rootEmployees: UserDto[];
}

export interface PaginationQuery {
    pageNumber: number;
    pageSize: number;
    searchTerm?: string;
    sortBy?: string;
    sortDescending?: boolean;
}

