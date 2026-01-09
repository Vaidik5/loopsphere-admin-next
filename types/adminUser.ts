export interface TeamsQueryApiResponse {
    success: boolean;
    message: string;
    data: any[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
    };
}