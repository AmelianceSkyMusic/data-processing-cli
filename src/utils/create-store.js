export function createStore(initData, actions) {
	let data = structuredClone(initData);
	return actions(data);
}
