export const getMatch = (code, values) => {
	if (code == null || code === undefined || !(code in values)) return values._;
	const value = values[code];
	return value === undefined ? values._ : value;
};
