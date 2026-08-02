// NavBar with popup menus

function wp_navbar_menu_activestack()
{
	this.depth = []; this.element = [];
}

//Entry point
function wp_navbar_menu(menubarid, navtree, options, styleOptions) 
{
	var me = this;
	
	//Internal vars:
	me.m_timeout = null; 
	me.m_active = null;

	//default options
	me.options =
	{	"m_bNoScript":false,
		"m_bStaticScript":false,
		"m_optAlignment":0,
		"m_optGap":1,
		"m_optPopupSeparation":1,
		"m_optTimeOut":500,
		"m_optShowBelow":1,
		"m_optShowRight":1,
		"m_optFirstPopupPosition":0,
		"m_sCssClass":''
	};
	if( options )
	{
		me.options = WpNavBar.mergeOptions( me.options, options );
		if(options.m_opTimeOut)	//Fix
		{	options.m_optTimeOut = options.m_opTimeOut; } 
	}
	me.styleOptions = 
	{	'm_bSlidingDoors' : false,
		'top' : {
		'm_sSpacerText' : '' }
	};
	if( styleOptions )
	{	me.styleOptions = WpNavBar.mergeOptions( me.styleOptions, styleOptions ); }

	me.write = function(s) 
	{
		if( this.options.m_bNoScript || this.options.m_bStaticScript )
		{	external.NavNoScriptWrite(s); }
		else
		{	document.write(s); }
	};

	me.Create = function(menubarid, navtree)
	{
		if( !navtree || !navtree.childArray )
		{	//NavTree could not be loaded
			return;
		}

		//Don't create submenus or rollover events in NOSCRIPT output
		//Also, we don't support m_bStaticScript so just do same as NOSCRIPT output
		var bAddScript = !this.options.m_bNoScript && !this.options.m_bStaticScript;
		
		//We write our own DIV element
		this.write( '<div id="'+this.options.m_sId+'" class="' + this.options.m_sCssClass + '" style="position:absolute;left:'+this.options.m_iLeft+'px; top:'+this.options.m_iTop+'px; width:'+this.options.m_iWidth+'px; height:'+this.options.m_iHeight+'px;'+'">' );

		//Write out the top-level items
		for( var index = 0; index < navtree.childArray.length; index++ )
		{
			var navbaritem = navtree.childArray[index];
			if( index != 0 && this.styleOptions.top.m_sSpacerText != '' )
			{
				this.write( '<span class="toplevelspacer">' );
				this.write( ( this.styleOptions.top.m_sSpacerText ) );
				this.write( '</span>' );
			}

			var bIsCurrentPage = navbaritem.bIsCurrentPage;
			var bHasChildren = navbaritem.childArray && (navbaritem.childArray.length > 0 );
			var navbaritemid = menubarid + '_' + index.toString();
			var menuidref = bHasChildren ? ('\'' + menubarid + '_P' + index.toString() + '\'') : 'null'; //Id of submenu as a string
	
			this.write( '<a ' );
			if( navbaritem.sUrl !== '' )
			{	this.write( 'href="' + navbaritem.sUrl + '"' ); }
			this.write( ' id="' + navbaritemid + '"' );
			if( navbaritem.sTarget )
			{	this.write( ' target="' + navbaritem.sTarget + '"' ); }
	
			if( bAddScript )
			{
				this.write( ' onmouseover="wp_navbar_menu.wp_MenuItemOver(\'' + navbaritemid + '\',' + menubarid + ',' + menuidref + ');"' );
				this.write( ' onmouseout="wp_navbar_menu.wp_MenuItemOut(\'' + navbaritemid + '\',' + menubarid + ');"' );
			}
			this.write( ' class="toplevelmenuitem' );
			if( index === 0 )
			{	this.write( ' toplevelmenuitem_firstchild' ); }
			if( index === navtree.childArray.length-1 )
			{	this.write( ' toplevelmenuitem_lastchild' ); }
			if( bIsCurrentPage )
			{	this.write( ' toplevelmenuitem_currentpage' ); }
			if( bAddScript && bHasChildren )
			{	this.write( ' toplevelmenuitem_hassubmenu' ); }
			if( navbaritem.sUrl === '' )
			{	this.write( ' toplevelmenuitem_inactive' ); }
			this.write(' normal');
			this.write( '"' );
	
			this.write( '>' );
	
			if( this.styleOptions.m_bSlidingDoors )
			{	this.write( '<span class="toplevelmenuitem">' ); }
			this.write( navbaritem.sTitle.replace(/ /g,"&nbsp;") );
			if( this.styleOptions.m_bSlidingDoors )
			{	this.write( '</span>' ); }
			this.write( '</a>' );
	
			if( bAddScript )
			{	
				this.InitElement(navbaritemid); 
			}
	
			if( this.options.m_optAlignment == 1 )
			{	this.write( '<br>' ); }	
		}
	
		this.write( '</div>' );
		
		if( bAddScript )
		{	//Create the child menus (outside the div)
			for( var index = 0; index < navtree.childArray.length; index++ )
			{
				var navbaritem = navtree.childArray[index];
				var menuid = menubarid + '_P' + index.toString();
				this.create_navbar_child_menus_recursive( menubarid, menuid, navbaritem );
			}
		}
		if( this.options.m_bNoScript || this.options.m_bStaticScript )
		{	external.NavNoScriptComplete(); }
	};
	

	me.create_navbar_child_menus_recursive = function( menubarid, menuid, parenttree )
	{
		var bHasChildren = ( parenttree.childArray ) && ( parenttree.childArray.length > 0 );
		if( !bHasChildren )
		{	return; }
	
		this.BeginMenu( menubarid, menuid );
		//Loop through each child in the tree (each of which will be a menu item)
		for( var index = 0; index < parenttree.childArray.length; index++)
		{
			var menuitem = parenttree.childArray[index];
			var menuitemid = menuid + '_I' + index.toString();
	
			var menuitemhaschildren = ( menuitem.childArray ) && ( menuitem.childArray.length > 0 );
			var childmenuid = menuitemhaschildren ? ( menuid + '_P' + index.toString() ) : null;
			var sTarget = ( menuitem.sTarget ) ? menuitem.sTarget : '_self';
			var bIsCurrentPage = ( menuitem.bIsCurrentPage === true );
			if( menuitem.bSeparator )
			{
				var separatorid = menuitemid + '_separator';
				this.AddLink( menubarid, separatorid, '', '', null, null, true, false );
			}
			this.AddLink(menubarid, menuitemid, menuitem.sTitle.replace(/ /g,"&nbsp;"), menuitem.sUrl, childmenuid, sTarget, false, bIsCurrentPage);
		}
		this.EndMenu();
	
		//Write out all the child menus of this menu
		for( var index = 0; index < parenttree.childArray.length; index++)
		{
			var menuitem = parenttree.childArray[index];
			var childmenuid = menuid + '_P' + index.toString();
			this.create_navbar_child_menus_recursive( menubarid, childmenuid, menuitem );
		}
	};

	me.InitElement = function(id_name)
	{ 
		var e = document.getElementById(id_name); 
		e.p_root = this; 
	};

	me.BeginMenu = function(menubarid, id_name) 
	{ 
		this.m_active = id_name;
		this.write('<table class="' + this.options.m_sCssClass + '_level1' + '" id="'+id_name+'" style="visibility:hidden;z-index:100;position:absolute;' /*+ this.styleOptions.level1.sStyle*/ + '">');
	};
	
	me.EndMenu = function()
	{
		this.write('</table>');
		this.m_active = null;
	};
	
	me.AddLink = function(menubarid,id_name,sTitle,sUrl,id_submenu,targetframe,bSeparator,bIsCurrentPage)
	{
		this.write('<tr>' );
		this.write('<td');
		this.write(' onmouseover="wp_navbar_menu.wp_SubMenuOver(\''+id_name+'\');"');
		this.write(' onmouseout="wp_navbar_menu.wp_SubMenuOut(\''+id_name+'\');" onclick="wp_navbar_menu.wp_ForceClose(\''+id_name+'\');"');
		this.write('>');

		if(bSeparator) 
		{	this.write('<hr' ); } 
		else if(sUrl==='')
		{	this.write('<p' ); } 
		else 
		{
			this.write( '<a href="' + sUrl + '"' );
			if( targetframe )
			{	this.write(' target="'+targetframe+'"'); }
		}
		this.write( ' class="' );
		if( id_submenu )
		{	this.write(' hassubmenu'); }
		if( bIsCurrentPage )
		{	this.write(' currentpage'); }
		this.write( '"' );
	
		this.write( ' id="'+id_name+'"' );
		this.write(' style="display:block;"');
	
		this.write('>');
		if(!bSeparator)
		{ 
			this.write(sTitle);
			if (sUrl==='')
			{	this.write('</p>'); } 
			else
			{	this.write('</a>'); }
		}
		
		this.write('</td></tr>\n');
		var e = document.getElementById(id_name); e.m_root = this; e.m_idchild = id_submenu; e.m_menu = this.m_active;
	};

	me.m_acStack = new wp_navbar_menu_activestack();
	
	me.Create(menubarid, navtree);
}

wp_navbar_menu.isIE = function() { return (/msie/i).test(navigator.userAgent) && !(/opera/i).test(navigator.userAgent); };

wp_navbar_menu.wp_MenuItemOver = function(id_name,p_root,id_sub)
{
	document.getElementById(id_name).m_root = p_root;
	clearInterval(p_root.m_timeout);
	if(id_sub)
	{	document.getElementById(id_sub).m_depth = 1; }
	p_root.m_active = id_name;
	p_root.m_acStack.push(0,id_name,id_sub); 
};

wp_navbar_menu.wp_MenuItemOut = function(id_name,p_menu)
{ 
	p_menu.m_timeout = setInterval("wp_navbar_menu.wp_Timeout('"+id_name+"')",p_menu.options.m_optTimeOut); 
};

wp_navbar_menu.wp_SubMenuOver = function(id_name)
{
	var e = document.getElementById(id_name);
	var pm = document.getElementById(e.m_menu);
	if(e.m_idchild)
	{	document.getElementById(e.m_idchild).m_depth = pm.m_depth+1; }
	clearInterval(e.m_root.m_timeout); 
	e.m_root.m_acStack.push(pm.m_depth,id_name,e.m_idchild); 
};

wp_navbar_menu.wp_SubMenuOut = function(id_name)
{
	var e = document.getElementById(id_name);
	if(e.m_root.m_active)
	{	e.m_root.m_timeout = setInterval("wp_navbar_menu.wp_Timeout('"+e.m_root.m_active+"')",e.m_root.options.m_optTimeOut); }
};

wp_navbar_menu.wp_Timeout = function(id_name) { var e = document.getElementById(id_name); e.p_root.m_acStack.clear(); e.p_root.m_active = null; };
wp_navbar_menu.wp_ForceClose = function(id_name) { var e = document.getElementById(id_name); clearInterval(e.m_root.m_timeout); e.m_root.m_acStack.clear(); e.m_root.m_active = null; };


wp_navbar_menu_activestack.prototype.count = 0;
wp_navbar_menu_activestack.prototype.m_padding = 20;

wp_navbar_menu_activestack.prototype.push = function(depth,idelem,idchild) 
{
	while(( this.count>0 )&&( depth<=this.depth[this.count-1] )) 
	{	this.pop(); }
	if(idelem) 
	{
		this.depth[this.count] = depth; this.element[this.count] = idelem; this.count++;
		document.getElementById(idelem).m_idchild = idchild;
		if(depth===0) 
		{ 
			if(idchild)
			{	this.ShowMenu(idchild,idelem,false); }
		} 
		else 
		{
			if(idchild) 
			{	this.ShowMenu(idchild,idelem,true); }
		}
	}
};

wp_navbar_menu_activestack.prototype.pop = function()
{
	if(this.count>0)
	{
		this.count--;
		var idchild = document.getElementById(this.element[this.count]).m_idchild;
		if(idchild)
		{	document.getElementById(idchild).style.visibility = "hidden"; }
		this.depth[this.count] = this.element[this.count] = null;
	}
};

wp_navbar_menu_activestack.prototype.clear = function() { while(this.count>0) { this.pop(); }};

wp_navbar_menu_activestack.prototype.ShowMenu = function(id_name,id_parent,down)
{
	var p = document.getElementById(id_parent); var e = document.getElementById(id_name); var top = 0; var left = 0;
	var c = p;	while(c && c.style.position!='relative') { top += c.offsetTop; left += c.offsetLeft; c = c.offsetParent; }
	if(p.m_root.options.m_optAlignment==1 || down)
	{
		var k = e.m_depth == 1 ? p.m_root.options.m_optGap : p.m_root.options.m_optPopupSeparation;
		if(p.m_root.options.m_optShowRight)
		{	left += p.offsetWidth + k; }
		else
		{	left -= e.offsetWidth - k; }
		if(!p.m_root.options.m_optShowBelow)
		{	top -= (e.offsetHeight - p.offsetHeight - (p.m_root.options.m_optPopupSeparation*2)); }
	}
	else
	{
		if(e.m_depth == 1)
		{
			if(p.m_root.options.m_optShowBelow)
			{	top += p.offsetHeight + p.m_root.options.m_optGap; }
			else 
			{	top -= (e.offsetHeight + p.m_root.options.m_optGap); }
		}
	}
	if(top+e.offsetHeight > document.body.scrollTop+document.body.clientHeight) 
	{	top = document.body.scrollTop+document.body.clientHeight-e.offsetHeight; }
	if(top<0)
	{	top = 0; }
	if(left+e.offsetWidth > document.body.scrollLeft+document.body.clientWidth)
	{	left = document.body.scrollLeft+document.body.clientWidth-e.offsetWidth; }
	if(left<0)
	{	left = 0; }
	if(e.m_depth == 1) 
	{ 
		if(p.m_root.m_optAlignment==1)
		{
			if(p.m_root.options.m_optFirstPopupPosition == 1) 
			{	top = top + (p.offsetHeight - e.offsetHeight) / 2; } 
			else if(p.m_root.options.m_optFirstPopupPosition == 2) 
			{	top = (top + p.offsetHeight) - e.offsetHeight; } 
		}
		else
		{
			if(p.m_root.options.m_optFirstPopupPosition == 1) 
			{	left = left + (p.offsetWidth - e.offsetWidth) / 2; } 
			else if(p.m_root.options.m_optFirstPopupPosition == 2)
			{	left = (left + p.offsetWidth) - e.offsetWidth; } 
			else if(p.m_root.options.m_optFirstPopupPosition == 3) 
			{	
				var iWidth = p.offsetWidth - (wp_navbar_menu.isIE() ? 0 : this.m_padding) - 1; 
				var vAnchors = e.getElementsByTagName(wp_navbar_menu.isIE() ? 'td' : 'a'); 
				for(var n = 0; n < vAnchors.length; ++n) 
				{	vAnchors[n].style.width = iWidth; }
			}
		}
	}
	e.style.top = top+"px"; e.style.left = left+"px"; e.style.visibility = "visible";
};
