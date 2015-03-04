angular.module('ez.progressSlider', [])

.constant('EzProgressSliderConfig', {
  draggableTarget: false,
  draggableProgress: true
})

.directive('ezProgressSlider', ['$parse', 'EzProgressSliderConfig', function($parse, EzProgressSliderConfig) {
  return {
    restrict: 'EA',
    templateUrl: 'ez-progress-slider-tpl.html',
    replace: true,
    scope: {
      progress: '=',
      target: '=?',
      config: '=?',
      onChange: '=?'
    },
    link: function(scope, $element) {
      $element.wrap('<div class="ez-progress-slider progress"></div>');

      scope.options = angular.extend({}, EzProgressSliderConfig, scope.config);
      scope.hasTarget = scope.hasOwnProperty('target');

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

      // progress drag handle start
      var progressX = getPercentInPixels(scope.progress);

      var setProgress = function() {
        if (totalWidth <= 0) {
          return;
        }

        progressEl.style.width = progressX + 'px';
        progressHandle.style.left = (progressX - 10) + 'px';
        textEl.innerHTML = Math.round(scope.progress) + '%';

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
          if (scope.progress < scope.target) {
            progressEl.classList.add('progress-bar-danger');
          } else {
            progressEl.classList.remove('progress-bar-danger');
          }
        }
      };

      var placeText = function() {
        if (progressX < 35) {
          textEl.style.left = (progressX + 20) + 'px';
          textEl.style.color = '#333';
        } else {
          textEl.style.left = '5px';
          textEl.style.color = '#fff';
        }
      };

      if (scope.options.draggableProgress) {
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

            scope.progress = getPercent(progressX, totalWidth);

            setProgress();
          },
          onend: function() {
            scope.$apply();
          }
        }).actionChecker(function(e, action) {
          return (e.which === 3) ? null: action; // disable right click
        });

        // handle clicking on slider
        $progressSliderEl.on('mousedown', function(e) {
          var $target = angular.element(e.target);
          if ($target.hasClass('ez-progress-slider') || $target.hasClass('progress-bar')) {
            progressX = e.offsetX;

            scope.$apply(function() {
              scope.progress = getPercent(progressX, totalWidth);
            });
          }
        });

      }

      // progress drag handle end

      // target drag handle start
      if (scope.hasTarget) {
        var targetX;

        var setTarget = function() {
          targetHandle.style.left = (targetX - 6) + 'px';
          targetHandle.setAttribute('title', scope.target + '%');

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

              scope.target = getPercent(targetX, totalWidth);

              setTarget();
            },
            onend: function() {
              scope.$apply();
            }
          }).actionChecker(function(e, action) {
            return (e.which === 3) ? null: action; // disable right click
          });
        }

        scope.$watch('target', function(newVal, oldVal) {
          newVal = parseInt(newVal, 10);

          if (newVal > 100) {
            return scope.target = 100;
          }

          if (newVal < 0) {
            return scope.target = 0;
          }

          targetX = getPercentInPixels(newVal);

          setTarget();

          if (newVal !== oldVal && typeof scope.onChange === 'function') {
            scope.onChange();
          }
        });
      } else {
        targetHandle.remove();
      }

      // target drag handle end

      scope.$watch('progress', function(newVal, oldVal) {
        newVal = parseInt(newVal, 10);

        if (newVal > 100) {
          return scope.progress = 100;
        }

        if (newVal < 0) {
          return scope.progress = 0;
        }

        progressX = getPercentInPixels(newVal);

        setProgress();

        if (newVal !== oldVal && typeof scope.onChange === 'function') {
          scope.onChange();
        }
      });

      // disable transitions after progress has loaded
      setTimeout(function() {
        progressEl.parentNode.classList.add('ez-loaded');
      }, 1000);
    }
  };
}])

;
