import { spy } from 'hanbi';

export const __postDataSpy = spy();

__postDataSpy.returns(Promise.resolve());

export const postData = __postDataSpy.handler;

export const __importMeta = import.meta;
