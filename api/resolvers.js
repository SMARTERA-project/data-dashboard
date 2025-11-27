const Datapoint = require('./models/Datapoint');
const {GraphQLScalarType} = require('graphql');
const GraphQLJSON = require('graphql-type-json');

module.exports = {
    JSON: GraphQLJSON,
    Query: {
        datapoints: async (_, { source, survey, dimensions, region, sortBy, sortOrder = 'ASC', limit, exclude, filterBy, filter }) => {
            try {
                const matchStage = {};

                if (source) {
                    matchStage.source = source;
                }

                if (survey) {
                    matchStage.survey = survey;
                }

                if (region) {
                    matchStage.region = region;
                }

                if (dimensions && exclude) {
                    const overlap = dimensions.filter(dim => exclude.includes(dim));
                    if (overlap.length > 0) {
                        throw new Error(`Invalid query: dimensions and exclude arrays have overlapping values: [${overlap.join(', ')}]`);
                    }
                }

                if (dimensions && dimensions.length > 0 && exclude && exclude.length > 0) {
                    matchStage.dimensions = {
                        $all: dimensions,
                        $nin: exclude
                    };
                } else if (dimensions && dimensions.length > 0) {
                    matchStage.dimensions = {
                        $all: dimensions
                    };
                } else if (exclude && exclude.length > 0) {
                    matchStage.dimensions = {
                        $nin: exclude
                    };
                }

                const pipeline = [{ $match: matchStage }];

                if (typeof filterBy === 'number' && filter && Array.isArray(filter) && filter.length > 0) {
                    pipeline.push({
                        $match: {
                            $expr: {
                                $in: [
                                    { $arrayElemAt: ["$dimensions", filterBy] },
                                    filter
                                ]
                            }
                        }
                    });
                }

                // Ensure sortBy and sortOrder are arrays
                const sortFields = Array.isArray(sortBy) ? sortBy : (sortBy ? [sortBy] : []);
                const sortOrders = Array.isArray(sortOrder) ? sortOrder : [sortOrder];

                if (sortFields.length > 0) {
                    const sortStage = {};
                    let addFieldsStage = null;

                    sortFields.forEach((field, index) => {
                        const order = (sortOrders[index] || 'ASC').toUpperCase() === 'DESC' ? -1 : 1;
                        if (field === 'year') {
                            if (!addFieldsStage) {
                                addFieldsStage = {
                                    $addFields: {
                                        yearNumeric: { $toInt: { $arrayElemAt: ["$dimensions", -1] } }
                                    }
                                };
                                pipeline.push(addFieldsStage);
                            }
                            sortStage['yearNumeric'] = order;
                        } else {
                            sortStage[field] = order;
                        }
                    });

                    pipeline.push({ $sort: sortStage });
                }

                if (limit) {
                    pipeline.push({ $limit: limit });
                }

                const datapoints = await Datapoint.aggregate(pipeline);

                // Convert timestamp to datetime format
                return datapoints.map(datapoint => {
                    if (datapoint.timestamp) {
                        datapoint.timestamp = new Date(datapoint.timestamp).toISOString();
                    }
                    return datapoint;
                });
            } catch (error) {
                console.error(error);
                throw new Error('Error fetching datapoints');
            }
        }
    }
};
