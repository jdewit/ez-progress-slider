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
      config: '=?'
    },

    compile: function(el) {
      el.wrap('<div class="ez-progress-slider progress"></div>');

      return function(scope, $element) {
        scope.options = angular.extend({}, EzProgressSliderConfig, scope.config);
        scope.hasTarget = scope.hasOwnProperty('target');

        var totalWidth;
        var progressEl = $element[0];
        var $progressSliderEl = $element.parent();
        var $progressSliderContainerEl = $progressSliderEl.parent();
        var progressHandle = progressEl.children[0];
        var targetHandle = progressEl.children[1];
        var textEl = progressEl.children[2];
        var progressPercent = parseInt(scope.progress, 10);

        var setWidth = function() {
          totalWidth = $progressSliderContainerEl.innerWidth();
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
        var progressX = getPercentInPixels(progressPercent);

        var setProgress = function() {
          if (totalWidth <= 0) {
            return;
          }

          progressPercent = Math.round((progressX / totalWidth) * 100);
          progressEl.style.width = progressX + 'px';
          progressHandle.style.left = (progressX - 10) + 'px';
          textEl.innerHTML = Math.round(progressPercent) + '%';

          if (scope.hasTarget) {
            if (progressPercent < targetPercent) {
              progressEl.classList.add('progress-bar-danger');
            } else {
              progressEl.classList.remove('progress-bar-danger');
            }
          }
        };

        if (scope.options.draggableProgress) {
          interact(progressHandle).draggable({
            axis: 'x',
            onstart: function(e) {
              progressX = getPercentInPixels(progressPercent);
            },
            onmove: function(e) {
              progressX = progressX + e.dx;

              if (progressX < 0 || progressX > totalWidth) {
                progressX = progressX - e.dx;
                return;
              }

              setProgress();
            },
            onend: function(e) {
              scope.$apply(function() {
                scope.progress = Math.round(progressPercent);
              });
            }
          }).actionChecker(function(e, action) {
            return (e.which === 3) ? null: action; // disable right click
          });
        }

        // progress drag handle end

        // target drag handle start
        if (scope.hasTarget) {
          var targetPercent = scope.target;
          var targetX = parseInt(getPercentInPixels(targetPercent), 10);

          var setTarget = function() {
            targetHandle.style.left = (targetX - 6) + 'px';
            targetHandle.setAttribute('title', targetPercent + '%');
          };

          if (scope.options.draggableTarget) {
            interact(targetHandle).draggable({
              axis: 'x',
              onstart: function(e) {
                targetX = getPercentInPixels(targetPercent);
              },
              onmove: function(e) {
                targetX = targetX + e.dx;

                if (targetX < 0 || targetX > totalWidth) {
                  targetX = targetX - e.dx;
                  return;
                }

                targetPercent = Math.round((targetX / totalWidth) * 100);

                setTarget();
              },
              onend: function(e) {
                scope.$apply(function() {
                  scope.target = Math.round(targetPercent);
                });
              }
            }).actionChecker(function(e, action) {
              return (e.which === 3) ? null: action; // disable right click
            });
          }

          setTarget();
        } else {
          targetHandle.remove();
        }

        $progressSliderEl.on('mousedown', function(e) {
          var $target =angular.element(e.target);
          if ($target.hasClass('ez-progress-slider') || $target.hasClass('progress-bar')) {
            progressX = e.offsetX;
            setProgress();

            scope.$apply(function() {
              scope.progress = Math.round(progressPercent);
            });

            interact.simulate('drag', progressHandle, e);
          }
        });

        // target drag handle end

        // init
        setProgress();

        // disable transitions after progress has loaded
        setTimeout(function() {
          progressEl.parentNode.classList.add('ez-loaded');
        }, 1000);
      };
    }
  };
}])

;
