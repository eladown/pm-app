module pmApp {
    class projectsService {

        public static $inject = [
            '$http',
            '$q',
            'apiService'
        ];

        private projects = [];

        private projectsLoadingPromise = null;

        constructor(public $http, public $q, public apiService) {}

        /**
         * Function will update projects list.
         * It will replace projects with the same id; if project has unique id it will be added to the list
         * @param newProjects
         */
        private updateProjects( newProjects ) {
            this.projects = newProjects;
        }

        /**
         * Load all open projects that user have access to them
         * @returns {promise}
         */
        loadOpenProjects() {
            let deferred = this.$q.defer();

            this.$http.get(this.apiService.getAbsoluteUrl('/projects/open'))
                .then(
                (result) => {
                    deferred.resolve(result.data);
                    this.updateProjects(result.data);
                },
                (data) => deferred.reject(data)
            );

            this.projectsLoadingPromise = deferred.promise;

            return deferred.promise;
        }

        /**
         * Return all projects
         * @returns {promise}
         */
        getProjects() {
            let deferred = this.$q.defer();

            this.$q.all([
                this.projectsLoadingPromise
            ]).then(
                () => deferred.resolve(this.projects),
                () => deferred.resolve(this.projects)
            );

            return deferred.promise;
        }
    }

    angular
        .module('pmApp')
        .service('projectsService', projectsService);
}