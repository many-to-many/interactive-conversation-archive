
var ArticleJointSourceController = JointSourceController.createComponent("ArticleJointSourceController");

ArticleJointSourceController.createViewFragment = function () {
  return cloneTemplate("#template-article");
};

// View

ArticleJointSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.view.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='edit-jointsource']").addEventListener("click", function (e) {
    e.preventDefault();
    var fragment = PublisherJointSourceController.createViewFragment();
    var element = fragment.querySelector(".publisher");
    document.body.appendChild(fragment);
    new PublisherJointSourceController(this.controller.jointSource, element);
  }.bind(this.view));

  var sourcesElement = this.view.querySelector(".sources");
  var sourceElement = sourcesElement.querySelector(".source");

  this.view.querySelector("[data-ica-action='previous-source']").addEventListener("click", function (e) {
    e.preventDefault();

    if (sourceElement.previousElementSibling) {
      sourceElement.style.display = "none";
      sourceElement = sourceElement.previousElementSibling;
      sourceElement.style.display = "";
      resizeSourcesHeight();
    }
  }.bind(sourcesElement));

  this.view.querySelector("[data-ica-action='next-source']").addEventListener("click", function (e) {
    e.preventDefault();

    if (sourceElement.nextElementSibling) {
      sourceElement.style.display = "none";
      sourceElement = sourceElement.nextElementSibling;
      sourceElement.style.display = "";
      resizeSourcesHeight();
    }
  }.bind(sourcesElement));

  // Resize height of sources box
  var resizeSourcesHeight = function () {
    if (sourceElement) {
      this.style.height = sourceElement.offsetHeight + "px";
    }
    for (var sourceIndex in this.children) {
      if (sourceElement == this.children[sourceIndex]) {
        this.parentNode.parentNode.querySelector("[data-ica-jointsource-source-index]").textContent = parseInt(sourceIndex) + 1;
        break;
      }
    }
    this.parentNode.parentNode.querySelector("[data-ica-action='previous-source']").style.opacity = sourceElement.previousElementSibling ? 1 : 0;
    this.parentNode.parentNode.querySelector("[data-ica-action='next-source']").style.opacity = sourceElement.nextElementSibling ? 1 : 0;
  }.bind(sourcesElement);

  this.resizeSourcesHeightRoutine = new Routine(resizeSourcesHeight, 1000, false);
  this.resizeSourcesHeightRoutine.componentOf = this;

  new TokensController(this.jointSource.metaParticipantsHandler, this.view.querySelector("[data-ica-jointsource-meta='participants']")).componentOf = this;
  new TokensController(this.jointSource.metaThemesHandler, this.view.querySelector("[data-ica-jointsource-meta='themes']")).componentOf = this;
});

ArticleJointSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelectorAll("[data-ica-jointsource-meta-predicate]").forEach(function (element) {
    var metaPredicate = getElementProperty(element, "jointsource-meta-predicate");
    if (ICA.empty(this.jointSource.meta[metaPredicate])) {
      element.style.display = "none";
    } else {
      element.style.display = "";
    }
  }.bind(this));

  this.view.querySelectorAll("[data-ica-jointsource-meta]").forEach(function (element) {
    element.textContent = this.jointSource.meta[getElementProperty(element, "jointsource-meta")];
  }.bind(this));

  this.view.querySelector(".jointsource-backdrop").hidden = true;
  var imageSources = this.jointSource.imageSources;
  if (imageSources.length > 0) {
    var imageSource = imageSources[0];

    if (imageSource.content) {
      this.view.querySelector(".jointsource-backdrop").hidden = false;
      this.view.querySelector(".jointsource-backdrop-image").style.backgroundImage = imageSource.content
        ? "url(" + (
          imageSource.fileHandler.blob instanceof Blob
            ? imageSource.fileHandler.url
            : imageSource.fileHandler.url + "?width=" + (2 * this.view.offsetWidth * this.devicePixelRatio)
          ) + ")"
        : "";
    }
  }

  this.jointSource.forEachSource(function (source) {
    if (this.controller.view.querySelector("[data-ica-source-id='{0}']".format(source.sourceId))) return;

    var fragment, element;
    switch (source.constructor) {
    case ImageSource:
      fragment = ArticleImageSourceController.createViewFragment();
      element = fragment.querySelector(".source");
      this.querySelector(".sources").appendChild(fragment);
      new ArticleImageSourceController(source, element).componentOf = this.controller;
      break;
    case AudioSource:
      fragment = ArticleAudioSourceController.createViewFragment();
      element = fragment.querySelector(".source");
      this.querySelector(".sources").appendChild(fragment);
      new ArticleAudioSourceController(source, element).componentOf = this.controller;
      break;
    case VideoSource:
      fragment = ArticleVideoSourceController.createViewFragment();
      element = fragment.querySelector(".source");
      this.querySelector(".sources").appendChild(fragment);
      new ArticleVideoSourceController(source, element).componentOf = this.controller;
      break;
    case TextSource:
    default:
      fragment = ArticleTextSourceController.createViewFragment();
      element = fragment.querySelector(".source");
      this.querySelector(".sources").appendChild(fragment);
      new ArticleTextSourceController(source, element).componentOf = this.controller;
    }

    element.style.display = "none";
  }.bind(this.view));

  this.resizeSourcesHeightRoutine.restart();
  this.view.querySelector("[data-ica-jointsource-number-of-sources]").textContent = this.jointSource.getNumberOfSources() + 1;

  setElementProperty(this.view.querySelector(".sources"), "ready", "");
});

ArticleJointSourceController.defineMethod("uninitView", function uninitView() {

  if (this.resizeSourcesHeightRoutine) {
    this.resizeSourcesHeightRoutine.destroy();
    delete this.resizeSourcesHeightRoutine;
  }

});
