import { Country } from 'src/country/entities/country.entity';
import { Role } from 'src/role/entities/role.entity';
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserAccountDetail } from './userAccountDetail.entity';

@Entity("user_account")
export class User {
    @PrimaryColumn({
        type:'uuid', 
        name:'user_id',
        default:()=> 'uuid_generate_v4()'
    })
    userId:string
    
    @Column({type:'varchar',length:100})
    name:string

    @Column({type:'varchar',length:100})
    lastname:string
    
    @Column({type:'varchar',length:100,unique:true})
    email:string
    
    @Column({name:"password_hash",type:'varchar',length:100})
    passwordHash:string
    
    @Column({name:"is_active",type:'boolean',default:true})
    isActive:boolean
    
    @Column({name:"create_At",type:'timestamp with time zone',default:()=> 'CURRENT_TIMESTAMP'})
    createAt:Date

    @Column({name:"role_id", type:"uuid", nullable:false})
    roleId:string

    @ManyToOne(() => Role, { eager: true }) 
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @ManyToOne(() => Country, { eager: true })
    @JoinColumn({ name: 'country_code', referencedColumnName: 'code' })
    country: Country;
    userDetail: UserAccountDetail
}
