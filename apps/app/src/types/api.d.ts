interface ActionSuccessResponse<T> {
  ok: true;
  data: T;
}

interface ApiErrorResponse {
  ok: false;
  message: string;
}

type ActionResponse<T> = ActionSuccessResponse<T> | ApiErrorResponse;
