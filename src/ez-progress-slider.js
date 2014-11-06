angular.module('ez.progressSlider', [])

.constant('EzProgressSliderConfig', {
  draggableTarget: false
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
    link: function(scope, $element) {
      $element.wrap('<div class="ez-progress-slider progress"></div>');

      scope.options = angular.extend({}, EzProgressSliderConfig, scope.config);

      var progressEl = $element[0];
      var progressHandle = progressEl.children[0];
      var targetHandle = progressEl.children[1];
      var textEl = progressEl.children[2];
      var totalWidth = $element.parent().innerWidth();
      var progressPercent = scope.progress;
      var hasTarget = scope.hasOwnProperty('target');

      var getPercentInPixels = function(percent) {
        return parseInt((percent * totalWidth / 100).toFixed(0), 10);
      };

      // progress drag handle start
      var progressX = getPercentInPixels(progressPercent);

      var setProgress = function() {
        progressEl.style.width = progressX + 'px';
        progressHandle.style.left = (progressX - 10) + 'px';
        textEl.innerHTML = Math.round(progressPercent) + '%';

        if (hasTarget) {
          if (progressPercent < targetPercent) {
            progressEl.classList.add('progress-bar-danger');
          } else {
            progressEl.classList.remove('progress-bar-danger');
          }
        }
      };

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

          progressPercent = Math.round((progressX / totalWidth) * 100);

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

      // progress drag handle end

      // target drag handle start
      if (hasTarget) {
        var targetPercent = scope.target;
        var targetX = getPercentInPixels(targetPercent);

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

      // target drag handle end

      // init
      setProgress();

      setTimeout(function() {
        progressEl.parentNode.classList.add('ez-loaded');
      }, 1000);
    }
  };
}])

;
