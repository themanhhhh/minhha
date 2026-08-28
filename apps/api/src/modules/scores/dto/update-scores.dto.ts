import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { ScoreEntryDto } from './score-entry.dto';
export class UpdateScoresDto { @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ScoreEntryDto) entries!: ScoreEntryDto[]; }
