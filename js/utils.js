export const formatName = name => name?.trim() ?? 'Không có tên';

export function mergeObjects(a, b) {
  return { ...a, ...b };
}
