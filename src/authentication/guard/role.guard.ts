import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enum/role.enum';
import { ROLE_KEY } from '../decorators/role.decoratos';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
    
    constructor(private reflector:Reflector){}
   
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        //Si el endpoint NO tiene el decorador @Roles(), es público
        if(!requiredRoles){
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            return false;
        }
        return requiredRoles.includes(user.role);

    }
    
    
}
