import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            fullName: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    }>;
    me(req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
    } | null>;
}
