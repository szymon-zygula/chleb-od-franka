export default function formatPrice(num: number): string {
    if(num != null) {
        return (num < 100 ? '0' : '') + (num + '').substr(0, (num + '').length - 2) + ',' + (num < 10 ? '0' : '') + (num + '').substr(-2);
    } 

    return '';
}
