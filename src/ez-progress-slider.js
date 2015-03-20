angular.module('ez.progressSlider', [])

.constant('EzProgressSliderConfig', {
  draggableTarget: false,
  draggableProgress: true,
  showProgressHandle: true,
  showTargetHandle: true,
  noInteraction: false
})

.directive('ezProgressSlider', ['$parse', 'EzProgressSliderConfig', function($parse, EzProgressSliderConfig) {
  return {
    restrict: 'EA',
    templateUrl: 'ez-progress-slider-tpl.html',
    replace: true,
    scope: {
      progress: '=',
      target: '=?',
      config: '=?'
    },
    link: function(scope, $element, attrs) {
      $element.wrap('<div class="ez-progress-slider progress"></div>');

      scope.options = angular.extend({}, EzProgressSliderConfig, scope.config);
      scope.hasTarget = !!attrs.target;

      for (var option in EzProgressSliderConfig) {
        if (!!attrs[option]) {
          scope.options[option] = $parse(attrs[option])(scope.$parent);
        }
      }

      var totalWidth;
      var progressEl = $element[0];
      var $progressSliderEl = $element.parent();
      var $progressSliderContainerEl = $progressSliderEl.parent();
      var progressHandle = progressEl.children[0];
      var targetHandle = progressEl.children[1];
      var textEl = progressEl.children[2];

      var setWidth = function() {
        totalWidth = $progressSliderContainerEl.width();
      };

      var getPercent = function(x, y) {
        x = parseInt(x, 10);
        y = parseInt(y, 10);

        if (y > 0) {
          return Math.round(x / y * 100);
        }

        return 0;
      };

      var getPercentInPixels = function(percent) {
        setWidth();

        if (percent) {
          return parseInt((percent * totalWidth / 100).toFixed(0), 10);
        } else {
          return 0;
        }
      };

      var setProgress = function(fromX) {
        if (totalWidth <= 0) {
          return;
        }

        progressEl.style.width = progressX + 'px';
        progressHandle.style.left = (progressX - 10) + 'px';

        textEl.innerHTML = Math.round(progress) + '%';

        if (scope.progress <= 50) {
          $progressSliderEl.addClass('under-50');
        } else {
          $progressSliderEl.removeClass('under-50');
        }

        placeText();

        updateBar();
      };

      var updateBar = function() {
        if (scope.hasTarget) {
          if (progress < target) {
            progressEl.classList.add('progress-bar-danger');
          } else {
            progressEl.classList.remove('progress-bar-danger');
          }
        }
      };

      var placeText = function() {
        if (progressX < 35) {
          if (scope.options.noInteraction) {
            textEl.style.left = (progressX + 5) + 'px';
          } else {
            textEl.style.left = (progressX + 20) + 'px';
          }

          textEl.style.color = '#333';
        } else {
          textEl.style.left = '5px';
          textEl.style.color = '#fff';
        }
      };

      if (scope.options.draggableProgress && !scope.options.noInteraction) {
        $progressSliderEl.addClass('draggable-progress');

        interact(progressHandle).draggable({
          axis: 'x',
          onstart: function() {
            progressX = getPercentInPixels(scope.progress);
          },
          onmove: function(e) {
            progressX = progressX + e.dx;

            placeText();

            if (progressX < 0 || progressX > totalWidth) {
              progressX = progressX - e.dx;
              return;
            }

            progress = getPercent(progressX, totalWidth);

            setProgress();
          },
          onend: function() {
            scope.progress = progress;

            setProgress();

            scope.$apply();
          }
        });

        // handle clicking on slider
        $progressSliderEl.on('mousedown', function(e) {
          var $target = angular.element(e.target);
          if ($target.hasClass('ez-progress-slider') || $target.hasClass('progress-bar')) {
            progressX = e.offsetX;

            scope.progress = progress = getPercent(progressX, totalWidth);

            setProgress();

            scope.$apply();
          }
        });
      }

      if (scope.hasTarget) {

        var setTarget = function() {

          targetHandle.style.left = (getPercentInPixels(target) - 6) + 'px';
          targetHandle.setAttribute('title', target + '%');

          updateBar();
        };

        if (scope.options.draggableTarget) {
          $progressSliderEl.addClass('draggable-target');

          interact(targetHandle).draggable({
            axis: 'x',
            onstart: function() {
              targetX = getPercentInPixels(scope.target);
            },
            onmove: function(e) {
              targetX = targetX + e.dx;

              if (targetX < 0 || targetX > totalWidth) {
                targetX = targetX - e.dx;
                return;
              }

              target = getPercent(targetX, totalWidth);

              setTarget();
            },
            onend: function() {
              setTarget();

              scope.target = target;

              scope.$apply();
            }
          });
        }

        scope.$watch('target', function(newVal, oldVal) {
          if (newVal === oldVal) {
            return;
          }

          target = parseInt(newVal, 10) || 0;

          if (target > 100) {
            target = 100;
          } else if (target < 0) {
            target = 0;
          }

          if (!!attrs.onChange) {
            $parse(attrs.onChange)(scope.$parent, {progress: progress, target: target});
          }

          setTarget();
        });

        // init
        var target = scope.target;
        var targetX = getPercentInPixels(target);
        setTarget();

      } else {
        scope.options.showTargetHandle = false;
      }

      scope.$watch('progress', function(newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }

        progress = parseInt(newVal, 10) || 0;

        if (progress > 100) {
          scope.progress = 100;

          return;
        } else if (progress < 0) {
          scope.progress = 0;

          return;
        }

        if (!!attrs.onChange) {
          $parse(attrs.onChange)(scope.$parent, {progress: progress, target: target});
        }

        progressX = getPercentInPixels(progress);

        setProgress();
      });

      // init
      var progress = scope.progress;
      var progressX = getPercentInPixels(progress);
      setProgress();

      // disable transitions after progress has loaded
      setTimeout(function() {
        progressEl.parentNode.classList.add('ez-loaded');
      }, 1000);
    }
  };
}])

;
