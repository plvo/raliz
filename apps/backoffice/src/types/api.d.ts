interface ActionSuccessResponse<T> {
  ok: true;
  data: T;
}

interface ActionErrorResponse {
  ok: false;
  message: string;
}

type ActionResponse<T> = ActionSuccessResponse<T> | ActionErrorResponse;
