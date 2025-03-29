import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { trace, context } from '@opentelemetry/api';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    const parentSpan = trace.getActiveSpan();
    
    if (parentSpan) {
      parentSpan.setAttribute('operation.type', 'greeting');
      parentSpan.setAttribute('user.role', 'guest');

      const tracer = trace.getTracer('nestjs-otlp-example');
      const businessSpan = tracer.startSpan('business-logic', {
        attributes: {
          'business.operation': 'get-greeting',
        },
      });

      try {
        const result = this.appService.getHello();

        businessSpan.setStatus({ code: 1 });
        return result;
      } catch (error) {
        businessSpan.recordException(error as Error);
        businessSpan.setStatus({
          code: 2,
          message: (error as Error).message,
        });
        throw error;
      } finally {
        businessSpan.end();
      }
    }

    return this.appService.getHello();
  }

  @Get('slow')
  async getSlowResponse(): Promise<string> {
    const parentSpan = trace.getActiveSpan();
    const tracer = trace.getTracer('nestjs-otlp-example');
    
    const processingSpan = tracer.startSpan('slow-processing');
    
    try {
      processingSpan.addEvent('Processing started');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      processingSpan.addEvent('Processing completed');
      processingSpan.setAttribute('processing.duration_ms', 2000);
      
      return 'This was a slow response';
    } finally {
      processingSpan.end();
    }
  }

  @Get('error')
  getError(): string {
    const tracer = trace.getTracer('nestjs-otlp-example');
    
    const errorSpan = tracer.startSpan('error-handling');
    
    try {
      throw new Error('This is a test error');
    } catch (error) {
      errorSpan.recordException(error as Error);
      errorSpan.setStatus({
        code: 2,
        message: (error as Error).message,
      });
      throw error;
    } finally {
      errorSpan.end();
    }
  }
}
