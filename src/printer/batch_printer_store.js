import { observable, action } from 'mobx'

class BatchPrinterStore {
  @observable pageSizes = []
  @observable cumulativeSizes = []
  @observable totalSize = 0

  @action
  addPageSize() {
    this.pageSizes = []
    this.cumulativeSizes = []
    this.totalSize = 0
  }

  @action
  setPageSizes(key, value) {
    this.pageSizes[key] = value

    // 更新累积大小
    if (key === 0) {
      this.cumulativeSizes[key] = value
    } else {
      this.cumulativeSizes[key] = this.cumulativeSizes[key - 1] + value
    }

    // 更新总大小
    this.totalSize = this.cumulativeSizes[this.cumulativeSizes.length - 1]
  }

  // 根据 分页 计算出前面页数的总和
  getPrePageSize(key) {
    if (key <= 0) {
      return 0
    }
    if (!this.cumulativeSizes.length) {
      return 0
    }
    return this.cumulativeSizes[key - 1] || 0
  }
}

export default new BatchPrinterStore()
