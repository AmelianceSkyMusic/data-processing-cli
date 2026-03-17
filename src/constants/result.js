import { ERROR_TYPE } from './error-type.js';

export const RESULT = {
	invalidInput: { ok: false, error: ERROR_TYPE.invalidInput },
	operationFailed: { ok: false, error: ERROR_TYPE.operationFailed },
	ok: { ok: true },
};
