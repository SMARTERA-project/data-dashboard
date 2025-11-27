const {gql} = require('graphql-tag');

module.exports = gql`
"""
Točka za prikaz na grafu
"""
    scalar JSON

    type Datapoint {
      	"""
	Vir podatkov (npr. ESTAT)
	"""
        source: String
	"""
	Raziskava - case sensitive! (npr. demo_r_pjanind3)
	"""
        survey: String
	"""
	Deskriptivni opis raziskave
	"""
        surveyName: String
	"""
	Regija (npr. NUTS3)
	"""
        region: String
	"""
	Povezava - vir podatkov
	"""
        fromUrl: String
	"""
	Čas pridobitve podatkov
	"""
        timestamp: String
	"""
	Polje dimenzij (npr. regija, leto ...)
	"""
        dimensions: [String]
	"""
	Vrednost
	"""
        value: JSON
}
"""
Povpraševanje
"""
    type Query {
	"""
	lahko se filtrira po source, survey, region, dimensions (polje več dimenzij, npr. ["Obalno-kraška","2024"], sortira se lahko po value ali year (sortBy) in naraščajoče ali padajoče ("ASC", "DESC"). Lahko se tudi omeji št. rezultatov z limit (npr. 5). Z exclude lahko podobno kot pri dimensions odstraniš dimenzije, ki jih ne želiš v podatkih. filterBy nastavi, po kateri dimenziji se filtrira (npr. 0, 1, 2 ...), filter pa so vrednosti, ki jih želiš filtrirati (npr. ["2024", "2025"]). Vrednost filterBy mora biti v razponu dimenzij.
	"""
        datapoints(source: String, survey: String, dimensions: [String!], region: String, sortBy: [String!], sortOrder: [String!], limit: Int, exclude: [String!], filterBy: Int, filter: [String!]): [Datapoint]
    }
        `;
