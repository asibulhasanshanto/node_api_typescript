import { Logger as WinstonLogger } from 'winston';
import { developmentLogger } from './development';
import { productionLogger } from './production';
export interface Logger extends WinstonLogger {}

const environment: string = process.env.NODE_ENV || 'production';
export const logger: Logger = environment === 'development' ? developmentLogger : productionLogger;
