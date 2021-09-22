namespace Utils {
    export function jump(path: string, target: any) {
        return () => {
            target.setState({
                location: path
            });
        };
    }
};

export default Utils;
