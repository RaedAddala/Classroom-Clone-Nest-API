import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpException,
    HttpStatus,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import { StudentService } from './student.service'; // Import the service
import { UpdateStudentDto } from './dto/update-student.dto';
import { SignUpDTO } from 'src/auth/dto/signup.dto';
import { AuthService } from 'src/auth/auth.service';
import { RoleEnum } from 'src/common/enum/roles.enum';
import { JWTGuard } from 'src/auth/guard/jwt.guard';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { UserDecorator } from 'src/common/decorators/user.decorator';

@Controller('student')
export class StudentController {
    constructor(
        private readonly studentsService: StudentService,
        private readonly authService: AuthService,
    ) {}

    @Post()
    async create(@Body() signUp: SignUpDTO) {
        const { valid, err } = await this.authService.checkValid(signUp);
        if (!valid) {
            if (!err) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
            throw err;
        }
        const result = await this.authService.CreateUser(signUp, RoleEnum.STUDENT);
        if (!result) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        if (!result.valid) {
            if (!result.err) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
            throw result.err;
        }
        const res = await this.studentsService.create({ ...signUp, role: RoleEnum.STUDENT });
        if (!res) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        return res;
    }
    @Get()
    @UseGuards(JWTGuard)
    findAll() {
        return this.studentsService.findAll();
    }

    @Get(':id')
    @UseGuards(JWTGuard)
    findOne(@Param('id') id: string) {
        return this.studentsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JWTGuard)
    update(@UserDecorator() user: JwtPayloadDto, @Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
        if (user.role != RoleEnum.ADMIN && user.id != id) throw new UnauthorizedException();
        return this.studentsService.update(id, updateStudentDto);
    }

    @Delete(':id')
    @UseGuards(JWTGuard)
    remove(@UserDecorator() user: JwtPayloadDto, @Param('id') id: string) {
        if (user.role != RoleEnum.ADMIN && user.id != id) throw new UnauthorizedException();
        return this.studentsService.remove(id);
    }
}