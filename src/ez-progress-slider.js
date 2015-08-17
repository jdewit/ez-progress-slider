angular.module('ez.progressSlider', [])

.constant('EzProgressSliderConfig', {
  draggableTarget: false,
  draggableProgress: true,
  showProgressHandle: true,
  showTargetHandle: true,
  inverseProgress: false
})

.directive('ezProgressSlider', ['$parse', 'EzProgressSliderConfig', function($parse, EzProgressSliderConfig) {
  return {
    restrict: 'EA',
    templateUrl: 'ez-progress-slider-tpl.html',
    replace: true,
    require: 'ngModel',
    scope: {
      disabled: '=?ngDisabled',
      target: '=?',
      config: '=?',
      delay: '=?' // render slider after a delay usefull if parent container transitions and has no width ie a modal
    },
    link: function(scope, $element, attrs, ngModel) {
      scope.options = angular.extend({}, EzProgressSliderConfig, scope.config);
      scope.hasTarget = !!attrs.target;

      for (var option in EzProgressSliderConfig) {
        if (!!attrs[option]) {
          scope.options[option] = $parse(attrs[option])(scope.$parent);
        }
      }

      var totalWidth;
      var $progressEl = $element.find('.progress');
      var $progressBarEl = $element.find('.progress-bar');
      var $progressSliderContainerEl = $element.parent();
      var $progressHandle = $element.find('.progress-handle');
      var $targetHandle = $element.find('.target-handle');
      var $textEl = $element.find('.progress-text');
      var progress;
      var progressX;
      var target;
      var targetX;
      var progressInteract;
      var progressClickHandler;
      var targetInteract;
      var targetWatcher;
      var delay = parseInt(scope.delay) || 0;

      $progressBarEl.height($progressEl.height());

      var setWidth = function() {
        console.log('w', $progressSliderContainerEl.width());
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

        console.log('gett', percent);
        if (percent) {
          return parseInt((percent * totalWidth / 100).toFixed(0), 10);
        } else {
          return 0;
        }
      };

      var setProgress = function() {
        if (totalWidth <= 0) {
          return;
        }

        $progressBarEl.css({width: progressX + 'px'});
        $progressHandle.css({left: (progressX - 10) + 'px'});

        $textEl.text(Math.round(progress) + '%');

        if (progress <= 50) {
          $element.addClass('under-50');
        } else {
          $element.removeClass('under-50');
        }

        placeText();

        updateBar();
      };

      var updateBar = function() {
        var isBehind = false;

        if (scope.hasTarget) {
          if (progress < target) {
            isBehind = true;
          }

          if (scope.options.inverseProgress) {
            isBehind = !isBehind;
          }

          if (isBehind) {
            $element.addClass('behind-target');
          } else {
            $element.removeClass('behind-target');
          }
        }
      };

      var placeText = function() {
        if (progressX < 35) {
          if (scope.disabled) {
            $textEl.css({left: (progressX + 5) + 'px'});
          } else {
            $textEl.css({left: (progressX + 20) + 'px'});
          }

          $textEl.css({color: '#333'});
        } else {
          $textEl.css({color: '#fff', left: '5px'});
        }
      };

      var setTarget = function() {
        $targetHandle.css({left: getPercentInPixels(target) + 'px'});
        $targetHandle.attr('title', target + '%');

        updateBar();
      };

      var initProgress = function() {
        console.log('initP', progress);
        progress = 0;
        progressX = getPercentInPixels(progress);
        console.log('x,', progressX);
        setProgress();
      };

      var initTarget = function() {
        targetWatcher = scope.$watch('target', function(newVal, oldVal) {
          if (newVal === oldVal) {
            return;
          }

          target = parseInt(newVal, 10) || 0;

          if (target > 100) {
            target = 100;
          } else if (target < 0) {
            target = 0;
          }

          setTarget();
        });

        target = scope.target;
        targetX = getPercentInPixels(target);
        setTarget();
      };

      var applyInteractions = function() {
        $element.removeClass('ez-disabled');

        if (scope.disabled) {
          return;
        }

        if (scope.options.draggableProgress) {
          $element.addClass('draggable-progress');

          progressInteract = interact($progressHandle[0]).draggable({
            axis: 'x',
            onstart: function() {
              progressX = getPercentInPixels(progress);
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
              setProgress();

              ngModel.$setViewValue(progress);

              scope.$apply();
            }
          });

          progressClickHandler = function(e) {
            var $target = angular.element(e.target);

            progressX = e.offsetX;

            progress = getPercent(progressX, totalWidth);

            setProgress();

            ngModel.$setViewValue(progress);

            scope.$apply();
          };

          $progressEl.on('mousedown', progressClickHandler);

          $progressBarEl.on('mousedown', progressClickHandler);
        }

        if (scope.hasTarget && scope.options.draggableTarget) {
          $element.addClass('draggable-target');

          targetInteract = interact($targetHandle[0]).draggable({
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
      };

      var disable = function() {
        $element.removeClass('draggable-progress');
        $element.addClass('ez-disabled');

        if (!!progressInteract) {
          progressInteract.unset();
          progressInteract = null;

          $progressEl.off('mousedown', progressClickHandler);

          $progressBarEl.off('mousedown', progressClickHandler);
        }

        if (!!targetInteract) {
          $element.addClass('draggable-target');

          targetInteract.unset();
          targetInteract = null;

          targetWatcher();
        }
      };

      ngModel.$render = function() {
        progress = parseInt(ngModel.$viewValue, 10) || 0;

        if (progress > 100) {
          progress = 100;
        } else if (progress < 0) {
          progress = 0;
        }

        progressX = getPercentInPixels(progress);

        setProgress();
      };

      scope.$watch('disabled', function(n, o) {
        if (n !== o) {
          if (n) {
            disable();
          } else {
            applyInteractions();
          }
        }
      });

      function init() {
        initProgress();
        initTarget();

        if (!scope.disabled) {
          applyInteractions();
        } else {
          $element.addClass('ez-disabled');
        }

        // disable transitions after progress has loaded
        setTimeout(function() {
          $element.addClass('ez-loaded');
        }, 1000);

        if (delay > 0) {
          setTimeout(function() {
            ngModel.$render();
          }, delay);
        }
      }

      init();
    }
  };
}])

;
