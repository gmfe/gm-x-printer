// 存量模板（config 无 mergeFields）的回退名单；新模板由编辑器写入 config.mergeFields，
// ERP 也可在运行前向表 config 注入 mergeFields 控制合并字段，无需改动打印库。
// 2026-10-10 补充：组合商品下单数不跨行合并，逐行展示。
const DEFAULT_PARENT_FIELDS = ['组合商品名称']

function isGroupedDeliveryTable(dataKey) {
  return (dataKey || '').split('_')[0] === 'allprodGrouped'
}

/** 读取表 config 的合并字段配置，缺失或非法时回退默认名单。 */
function getGroupedMergeFields(config) {
  const mergeFields = config && config.mergeFields
  if (!Array.isArray(mergeFields)) {
    return DEFAULT_PARENT_FIELDS
  }
  const fields = mergeFields.filter(field => typeof field === 'string')
  return fields.length ? fields : DEFAULT_PARENT_FIELDS
}

/**
 * Only parent-field columns merge. Headers and editable formulas are independent
 * of group identity; formulas containing child fields must retain each child's value.
 */
function isGroupedParentColumn(text, suffix, parentFields) {
  const expressions = (text || '').match(/{{[\s\S]+?}}/g) || []
  const expressionText = expressions.join(' ')
  const fieldPattern = /列\.([\w\u4e00-\u9fff]+)/g
  const fields = expressionText.match(fieldPattern) || []
  // Bracket access, optional chains, whitespace and aliases can hide child
  // references. Keep each row unless every reference is a known parent token.
  const hasUnrecognizedRowAccess = expressionText
    .replace(fieldPattern, '')
    .includes('列')
  return (
    !hasUnrecognizedRowAccess &&
    fields.length > 0 &&
    fields.every(field =>
      parentFields.some(parent => field === `列.${parent}${suffix}`)
    )
  )
}

/**
 * Resolve one lane of the actual rows rendered on ONE page. A positive span
 * renders a td; 0 omits a covered td. Never modify the shared print data.
 */
function getGroupedDeliveryRowSpans(
  rows,
  lane,
  columnText,
  dataKey,
  multiSuffix = '_MULTI_SUFFIX',
  parentFields = DEFAULT_PARENT_FIELDS
) {
  const spans = rows.map(() => 1)
  const suffix = lane ? `${multiSuffix}${lane > 1 ? lane + 1 : ''}` : ''
  if (
    !isGroupedDeliveryTable(dataKey) ||
    !isGroupedParentColumn(columnText, suffix, parentFields)
  ) {
    return spans
  }
  const getIdentity = row => {
    if (
      !row ||
      Array.isArray(row) ||
      row._special ||
      row[`_isEmptyData${suffix}`]
    ) {
      return undefined
    }
    const identity = row[`_combineGroupKey${suffix}`]
    return identity === '' || identity === null ? undefined : identity
  }
  let start = 0
  while (start < rows.length) {
    const identity = getIdentity(rows[start])
    let end = start + 1
    if (identity !== undefined) {
      while (end < rows.length && getIdentity(rows[end]) === identity) end++
    }
    spans[start] = end - start
    for (let covered = start + 1; covered < end; covered++) {
      spans[covered] = 0
    }
    start = end
  }
  return spans
}

module.exports = {
  getGroupedDeliveryRowSpans,
  getGroupedMergeFields,
  isGroupedDeliveryTable,
  DEFAULT_PARENT_FIELDS
}
