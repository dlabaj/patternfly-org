const visit = require('unist-util-visit');

const contentStyledMdTags = [
  'p',
  'ul',
  'ol',
  'li',
  'dl',
  'blockquote',
  'small',
  'hr',
  'dt',
  'dd'
];

const styledMdTags = [
  ...contentStyledMdTags,
  'code',
  'table',
  'img'
]

function styledTags() {
  return tree => {
    visit(tree, 'element', node => {
      node.properties.className = node.properties.className || '';
      
      if (contentStyledMdTags.includes(node.tagName)) {
        node.properties.className += `pf-v6-c-content--${node.tagName} pf-m-editorial`;
      }

      if (styledMdTags.includes(node.tagName)) {
        node.properties.className += node.properties.className ? ' ' : '';
        node.properties.className += `ws-${node.tagName} `;
        // Match pf-v6-c-table implementation
        // https://pf4.patternfly.org/components/table/html/basic-table/
        if (node.tagName === 'table') {
          node.properties.className += ' pf-v6-c-table pf-m-grid-lg pf-m-compact';
          node.properties.role = 'grid';
          let columnHeaders = [];
          for (let child of node.children) {
            if (child.tagName === 'thead') {
              child.properties.className = 'pf-v6-c-table__thead';
              // Find column headers
              const tr = child.children.find(child => child.tagName === 'tr');
              tr.properties.role = 'row';
              tr.properties.className = 'pf-v6-c-table__tr';
              tr.children
                .filter(child => child.tagName === 'th')
                .forEach(th => {
                  th.properties.className = `${th.properties.className} pf-v6-c-table__th pf-m-wrap`;
                  th.properties.role = 'columnheader';
                  th.properties.scope = 'col';
                  let colName = '';
                  visit(th, 'text', node2 => colName += node2.value);
                  columnHeaders.push(colName);
                  // Need to wrap in div for css-grid stuffs
                  th.children = [{
                    type: 'element',
                    tagName: 'div',
                    properties: {},
                    children: th.children
                  }];
                });
            }
            else if (child.tagName === 'tbody') {
              child.properties.role = 'rowgroup';
              child.properties.className = 'pf-v6-c-table__tbody';
              child.children
                .filter(tr => tr.tagName === 'tr')
                .forEach(tr => {
                  tr.properties.role = 'row';
                  tr.properties.className = 'pf-v6-c-table__tr';
                  tr.children
                    .filter(td => td.tagName === 'td')
                    .forEach((td, i) => {
                      td.properties.role = 'cell';
                      td.properties.className = 'pf-v6-c-table__td';
                      if (columnHeaders[i]) {
                        td.properties['data-label'] = columnHeaders[i];
                      }
                      // Need to wrap in div for css-grid stuffs
                      td.children = [{
                        type: 'element',
                        tagName: 'div',
                        properties: {},
                        children: td.children
                      }];
                    });
                });
            }
          }
        }
      }
    });
  }
}

module.exports = styledTags;
