export const convertTime = (timestamp) => {
    const date = new Date(Number(timestamp)/1e6);
    return date.toLocaleString();
};

export const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 12)}...${address.slice(-8)}`;
}; 