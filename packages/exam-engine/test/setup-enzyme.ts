import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import jsdomGlobal from 'jsdom-global'

jsdomGlobal()

Enzyme.configure({
  adapter: new Adapter()
})
