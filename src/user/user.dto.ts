export class LeaderboardUserDto {
    id: string;
    giftsReceived: number;
    rank: number;
    firstLastName: string;
}

export class LeaderboardResponseDto {
    users: LeaderboardUserDto[];
    currentPage: number;
    currentUser: {
        id: string;
        giftsReceived: number;
        rank: number;
        firstLastName: string;
    };
}