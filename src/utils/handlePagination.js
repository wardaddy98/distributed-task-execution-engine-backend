const handlePagination = async (model, page, filterOptions = {}, limit = 10) => {
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * limit;

  const { rows: data, count: totalCount } = await model.findAndCountAll({
    where: filterOptions,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data,
    pagination: {
      totalCount,
      totalPages,
      currentPage,
    },
  };
};

export default handlePagination;
