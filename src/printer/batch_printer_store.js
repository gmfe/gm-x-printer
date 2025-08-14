import _ from 'lodash'
import { observable, action } from 'mobx'

class BatchPrinterStore {
  @observable pageSizes = []
  @observable cumulativeSizes = []
  @observable totalSize = 0
  @observable totalSizes = {}

  @action
  addPageSize() {
    this.pageSizes = []
    this.cumulativeSizes = {}
    this.totalSize = 0
  }

  @action
  setPageSizes(key, value) {
    const [id, i] = key.split('-')

    const index = Number(i)

    if (!this.cumulativeSizes[id]) {
      this.cumulativeSizes[id] = {}
    }

    if (index === 0) {
      this.cumulativeSizes[id][index] = value
    } else {
      const startIndex = this.cumulativeSizes[id][index - 1]
      this.cumulativeSizes[id][index] = (startIndex || 0) + value
    }

    const totals = Object.values(this.cumulativeSizes[id])[
      Object.values(this.cumulativeSizes[id]).length - 1
    ]

    this.totalSizes = {
      ...this.totalSizes,
      [id]: totals
    }

    // 更新总大小
    this.totalSize = this.cumulativeSizes[this.cumulativeSizes.length - 1]
  }

  // 根据 分页 计算出前面页数的总和
  getPrePageSize(key) {
    const [id, i] = key.split('-')
    const index = Number(i)
    if (index <= 0) {
      return 0
    }
    if (!this.cumulativeSizes[id]) {
      return 0
    }
    return this.cumulativeSizes[id][index - 1] || 0
  }
}

export default new BatchPrinterStore()
