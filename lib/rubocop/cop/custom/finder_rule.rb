module RuboCop
  module Cop
    module Custom
      class FinderRule < Cop
        MSG = 'Utilisez `.find_by` au lieu de `.find` pour éviter les crashs.'.freeze

        def on_send(node)
          return unless node.method?(:find) && node.arguments?

          add_offense(node, message: MSG)
        end
      end
    end
  end
end
