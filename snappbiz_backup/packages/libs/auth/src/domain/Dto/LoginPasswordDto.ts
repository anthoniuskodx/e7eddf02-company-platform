// DTOs
export interface ILoginPasswordDto {
    phoneNumber: string;
    password: string;
}

export class LoginPasswordDto implements ILoginPasswordDto {
    phoneNumber: string;
    password: string;

    constructor(phoneNumber: string, password: string) {
        this.phoneNumber = phoneNumber;
        this.password = password;
    }
}