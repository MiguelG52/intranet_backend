export class CreateNewsDto {
    content:string
    authorId:string
    title:string
    imageUrl?:string
    newsAudience:{
        countryCode?:string
        isPinned:boolean
    }
}
