var FilterHandler = React.createClass({
  render: function() {
    return (
      <li className={"filter" + this.props.data.id}>
        <a href='javascript:void(0)' data-filter={this.props.data.id}>
          <span className='c'>{this.props.data.name}</span>
          <i className='icon-caret-down'></i>
          <i className='icon-caret-up'></i>
          <span className='d'>{this.props.data.caption}</span>
        </a>
      </li>
    );
  }
});

var FilterHandlerList = React.createClass({
  render: function() {
    var handlers = this.props.filters.map(function(handler) {
      return (
        <FilterHandler data={handler} key={handler.id} />
      );
    });
    return (
      <ul className='filters'>
        {handlers}
      </ul>
    );
  }
});

var Filter = React.createClass({
  render: function() {
    return (
      <a className={'option option' + this.props.filter.id}
        data-id={this.props.filter.id}
        href='javascript:void(0)'>{this.props.filter.name}</a>
    );
  }
});

var FilterGroup = React.createClass({
  render: function() {
    var filters = this.props.filter.content.map(function(filter) {
      return (
        <Filter filter={filter} key={filter.id} />
      );
    })
    return (
      <div className={'filter tagged filter' + this.props.filter.id}>
        <div className='content'>
          {filters}
        </div>
      </div>
    );
  }
});

var FilterGroupList = React.createClass({
  render: function() {
    var filters = this.props.filters.map(function(filter) {
      return (
        <FilterGroup filter={filter} key={filter.id} />
      );
    })
    return (
      <div>
        {filters}
      </div>
    );
  }
})

$.get('/filters', function(response) {
  var filters = JSON.parse(response);
  ReactDOM.render(
    <FilterHandlerList filters={filters} />,
    document.getElementById('filterHanderContainer')
  );
  ReactDOM.render(
    <FilterGroupList filters={filters} />,
    document.getElementById('filterContainer')
  );
})
