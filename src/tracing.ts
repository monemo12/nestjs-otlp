import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'nestjs-otlp-example',
});

const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
  headers: {
    'Content-Type': 'application/json',
  },
  timeoutMillis: 15000,
});

export const otelSDK = new NodeSDK({
  resource,
  traceExporter,
  spanProcessor: new SimpleSpanProcessor(traceExporter),
  instrumentations: [getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-http': {
      enabled: true,
    },
    '@opentelemetry/instrumentation-express': {
      enabled: true,
    },
  })],
});

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
}); 