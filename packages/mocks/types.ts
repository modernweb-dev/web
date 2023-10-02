export interface Mock {
  method: string;
  endpoint: string;
  handler: handler;
  [key: symbol]: string;
}

export type handler = ({
  request,
  cookies,
  params,
}: {
  request: Request;
  cookies: Record<string, unknown>;
  params: Record<string, unknown>;
}) => Response | Promise<Response>;
