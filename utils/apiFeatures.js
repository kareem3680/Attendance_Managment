class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = [
      "limit",
      "page",
      "fields",
      "sort",
      "keyword",
      "startDate",
      "endDate",
      "from",
      "to",
      "search",
    ];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    const start = this.queryString.startDate || this.queryString.from;
    const end = this.queryString.endDate || this.queryString.to;
    if (start || end) {
      const dateFilter = {};
      if (start) dateFilter.$gte = new Date(start);
      if (end) dateFilter.$lte = new Date(end);
      this.mongooseQuery = this.mongooseQuery.find({ createdAt: dateFilter });
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  search() {
    if (this.queryString.keyword) {
      const query = {
        $or: [
          { name: { $regex: this.queryString.keyword, $options: "i" } },
          { title: { $regex: this.queryString.keyword, $options: "i" } },
          { description: { $regex: this.queryString.keyword, $options: "i" } },
        ],
      };
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  paginate(totalDocs) {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;
    const end = page * limit;

    const pagination = {
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
    };
    if (end < totalDocs) pagination.next = page + 1;
    if (skip > 0) pagination.prev = page - 1;

    this.paginationResult = pagination;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }

  populate(paths = []) {
    paths.forEach((p) => {
      this.mongooseQuery = this.mongooseQuery.populate(p);
    });
    return this;
  }
}

export default ApiFeatures;
