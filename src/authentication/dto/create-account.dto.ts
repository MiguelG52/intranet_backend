
export class CreateAccountDto{
    email:string;
    password:string;
    name:string;
    lastname:string;
    role:string;
    phone?:string;
    countryCode:string;
    teamId:string;
    birthdate:Date;
    msTeamsId?:string;
}