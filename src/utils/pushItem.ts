interface pushItemsFunc {
    <T>(target: Array<T>, ...items: Array<T>): Array<T>
}
export const pushItems: pushItemsFunc = (target, ...items) => {
    Array.prototype.push.apply(target, items)
    return target
}
