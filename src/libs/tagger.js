/**
 * Creates a set of tags from a given text.
 * 
 * @param {String} text - The input Text object from which tags will be extracted.
 */
export function createTagsFromText(
    text
) {

    const uniqueTags = new Set(text.split(" ").filter(item => {
        item = item.trim();
        return Boolean(item) ? item.length > 2 : false;
    }));

    return [...uniqueTags];
}