export class LeaderboardUserDto {
    id: string;
    giftsReceived: number;
    rank: number;
}

export class LeaderboardResponseDto {
    users: LeaderboardUserDto[];
    total: number;
    currentPage: number;
    pages: number;
    currentUser: {
        id: string;
        giftsReceived: number;
        rank: number;
    };
}