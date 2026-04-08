export interface ISuperadminLoginDto {
    username: string;
    password: string;
    clientId: string;
}

export class SuperadminLoginDto implements ISuperadminLoginDto {
    username: string;
    password: string;
    clientId: string;
    
    constructor(data: ISuperadminLoginDto) {
        this.username = data.username;
        this.password = data.password;
        this.clientId = data.clientId;
    }
}
