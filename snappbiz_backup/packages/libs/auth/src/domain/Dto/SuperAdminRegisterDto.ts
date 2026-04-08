export interface ISuperadminRegisterDto {
    username: string;
    email: string;
    password: string;
    clientId: string;
}

export class SuperadminRegisterDto implements ISuperadminRegisterDto {
    username: string;
    email: string;
    password: string;
    clientId: string;

    constructor(data: ISuperadminRegisterDto) {
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.clientId = data.clientId;
    }
}
