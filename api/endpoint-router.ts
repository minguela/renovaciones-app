type ApiHandler = (req: any, res: any) => Promise<unknown> | unknown

/** Keep the existing GET path separate while routing other methods to a write handler. */
export function createGetAndWriteRouter(getHandler: ApiHandler, writeHandler: ApiHandler): ApiHandler {
  return (req, res) => req.method === 'GET' ? getHandler(req, res) : writeHandler(req, res)
}
