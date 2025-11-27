class DataPoint {
    constructor(source, survey, surveyName, region, fromUrl, dimensions, value) {
        this.source = source;
        this.survey = survey;
        this.surveyName = surveyName;
        this.region = region;
        this.fromUrl = fromUrl;
        this.timestamp = timestamp;
        this.dimensions = dimensions;
        this.value = value;
    }
}

module.exports = { DataPoint };